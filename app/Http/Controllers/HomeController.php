<?php
/**
 * Created by PhpStorm.
 * User: ryuji
 * Date: 2016/02/28
 * Time: 午後7:23
 */

namespace App\Http\Controllers;

use Log;
use Session;
use View;
use App\User;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use GuzzleHttp\TransferStats;
use GuzzleHttp\Exception\RequestException;
use League\OAuth2\Client\Provider;

class HomeController extends Controller {

    private $projects = [];
    private $issues = [];
    private $sensors = [];
    private $code = "";
    private $token = "";
    private $refresh_token = "";
    private $write_token = "";
    
    /**
     * Show the application 'home' to the user.
     *
     * @return this
     */
    public function index(Request $request)
    {
        $profile = "";
        
        if(Session::get('token') != null){
            try {
                $uri = config('oauth_endpoint');

                $client = new \GuzzleHttp\Client();

                $response = $client->request('GET', 'https://developer.api.autodesk.com/userprofile/v1/users/@me', [
                    'headers' => [
                        'Authorization'      => 'Bearer '.Session::get('token')
                    ],
                    'on_stats' => function (TransferStats $stats) use (&$url) {
                        $url = $stats->getEffectiveUri();
                    }
                ]);
            } catch (RequestException $e) {
                return redirect('/')->with('message', $e->getMessage());
            }

            $content = $response->getBody()->getContents();
            $profile = json_decode($response->getBody(), true);
        }
        
        // initial method for accessing the route page
        return view('home')->with([
            "projects" => $this->projects,
            "issues" => $this->issues,
            "sensors" => $this->sensors,
            "client_id" => config('bim360.client_id'),
            "profile" => $profile
        ]);
    }
    
    public function authenticate(Request $request){

        $provider = new \League\OAuth2\Client\Provider\GenericProvider([
            'clientId'                => config('bim360.client_id'),
            'clientSecret'            => config('bim360.client_secret'),
            'redirectUri'             => config('bim360.redirect_uri'),
            'urlAuthorize'            => config('bim360.oauth_endpoint'),
            'urlAccessToken'          => config('bim360.token_endpoint'),
            'urlResourceOwnerDetails' => config('bim360.resource'),
            'scope' => config('bim360.scope')
        ]);

        // If we don't have an authorization code then get one
        if (!$request->input('code') != null) {

            // Fetch the authorization URL from the provider; this returns the
            // urlAuthorize option and generates and applies any necessary parameters
            // (e.g. state).
            $authorizationUrl = $provider->getAuthorizationUrl();

            // Get the state generated for you and store it to the session.
            $_SESSION['oauth2state'] = $provider->getState();

            // Redirect the user to the authorization URL.
            // header('Location: ' . $authorizationUrl);
            return response()->json(json_encode(['url'=> $authorizationUrl . '&response_type=code']));

        // Check given state against previously stored one to mitigate CSRF attack
        } elseif ($request->input('state') == '' || ($request->input('state') !== $_SESSION['oauth2state'])) {

            unset($_SESSION['oauth2state']);
            exit('Invalid state');

        }
    }
    
    public function get_access_token(Request $request){

        try {

            $provider = new \League\OAuth2\Client\Provider\GenericProvider([
                'clientId'                => config('bim360.client_id'),
                'clientSecret'            => config('bim360.client_secret'),
                'redirectUri'             => config('bim360.redirect_uri'),
                'urlAuthorize'            => config('bim360.oauth_endpoint'),
                'urlAccessToken'          => config('bim360.token_endpoint'),
                'urlResourceOwnerDetails' => config('bim360.resource'),
                'scope' => config('bim360.scope')
            ]);

            // Try to get an access token using the authorization code grant.
            $accessToken = $provider->getAccessToken('authorization_code', [
                'code' =>  $request->input('code')
            ]);
            
            Session::put('token', $accessToken->getToken());
            Session::put('refresh_token', $accessToken->getRefreshToken());

        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

            // Failed to get the access token or user details.
            exit($e->getMessage());
        }
        
        return '<script>window.opener.location.reload(false);window.close();</script>';
    }
    
    public function get_3_legged_token(Request $request){
        
        return response(Session::get('token'));
    }

    public function logout(Request $request)
    {
        if(Session::get('token') != ""){
            Session::forget('token');
            Session::forget('refresh_token');
            $this->token = "";
            $this->refresh_token = "";
        }

        // initial method for accessing the route page
        return Redirect::secure('/');
    }

    /**
     * Login
     *
     * @param Request $request
     * @return $this
     */
    public function login(Request $request) {

        // validation check
        $validator = Validator::make($request->all(), [
            'username' => 'required|max:255',
            'password' => 'required|max:255'
        ]);

        if ($validator->fails()) {
            return redirect('/')
                ->withInput()
                ->withErrors($validator);
        }

        // login by HTTP Request to BIM 360 Field REST API
        try {
            $client = new \GuzzleHttp\Client(['base_uri' => 'https://bim360field.autodesk.com']);

            $response = $client->request('POST', '/api/login', [
                'json' => [
                    'username' => $request->input('username'),
                    'password' => $request->input('password')
                ],
                'on_stats' => function (TransferStats $stats) use (&$url) {
                    $url = $stats->getEffectiveUri();
                }
            ]);
        } catch (RequestException $e) {

            return redirect('/')->with('message', $e->getMessage());
        }

        // get response
        $content = $response->getBody()->getContents();
        $data = json_decode($response->getBody(), true);
        
        // set Field User ticket to the session
        Session::put('ticket', $data['ticket']);
        Session::put('username', $request->input('username'));
        
        return response()->json($content);
    }

    /**
     * Get Hub List
     *
     * @param Request $request
     * @return $this
     */
    public function get_hub(Request $request){

        // check if Field User ticket is in the session
        if(Session::has('token')){
            $this->token = Session::get('token');
        }
        else {
            return redirect('/')->with('message', 'Field user ticket is expired. Please try to login.');
        }

        try {
            $uri = config('oauth_endpoint');

            $client = new \GuzzleHttp\Client();

            $response = $client->request('GET', 'https://developer.api.autodesk.com/project/v1/hubs', [
                'headers' => [
                    'Authorization'      => 'Bearer '.Session::get('token')
                ],
                'on_stats' => function (TransferStats $stats) use (&$url) {
                    $url = $stats->getEffectiveUri();
                }
            ]);
        } catch (RequestException $e) {
            return redirect('/')->with('message', $e->getMessage());
        }

        $content = $response->getBody()->getContents();
        $data = json_decode($response->getBody(), true);
        
        return View::make('hub')->with('hubs', $data['data']);
    }

    /**
     * Get Project List
     *
     * @param Request $request
     * @return $this
     */
    public function get_projects($hub_id){

        // check if Field User ticket is in the session
        if(Session::has('token')){
            $this->token = Session::get('token');
        }
        else {
            return redirect('/')->with('message', 'Field user ticket is expired. Please try to login.');
        }

        try {
            $uri = config('oauth_endpoint');

            $client = new \GuzzleHttp\Client();

            $response = $client->request('GET', 'https://developer.api.autodesk.com/project/v1/hubs/'. $hub_id .'/projects', [
                'headers' => [
                    'Authorization'      => 'Bearer '.Session::get('token')
                ],
                'on_stats' => function (TransferStats $stats) use (&$url) {
                    $url = $stats->getEffectiveUri();
                }
            ]);
        } catch (RequestException $e) {
            return redirect('/')->with('message', $e->getMessage());
        }

        $content = $response->getBody()->getContents();
        $data = json_decode($response->getBody(), true);

        return View::make('projects')->with('projects', $data['data']);
    }

    /**
     * Get Item List
     *
     * @param Request $request
     * @return $this
     */
    public function get_items($project_id, $folder_id){

        // check if Field User ticket is in the session
        if(Session::has('token')){
            $this->token = Session::get('token');
        }
        else {
            return redirect('/')->with('message', 'Field user ticket is expired. Please try to login.');
        }

        try {
            $uri = config('oauth_endpoint');

            $client = new \GuzzleHttp\Client();

            $response = $client->request('GET', 'https://developer.api.autodesk.com/data/v1/projects/'. $project_id .'/folders/'. $folder_id .'/contents', [
                'headers' => [
                    'Authorization'      => 'Bearer '.Session::get('token')
                ],
                'on_stats' => function (TransferStats $stats) use (&$url) {
                    $url = $stats->getEffectiveUri();
                }
            ]);
        } catch (RequestException $e) {
            return redirect('/')->with('message', $e->getMessage());
        }

        $content = $response->getBody()->getContents();
        $data = json_decode($response->getBody(), true);

        return View::make('items')->with('items', $data['data'])->with("derivatives", $data['included']);
    }

    /**
     * Prepare viewer
     *
     * @param Request $request
     * @return $this
     */
    public function prepare_viewer($urn){

        // check if Field User ticket is in the session
        if(Session::has('token') && Session::has('refresh_token')){
            $this->token = Session::get('token');
            $this->refresh_token = Session::get('refresh_token');
        }
        else {
            return redirect('/')->with('message', 'Field user ticket is expired. Please try to login.');
        }

        $encodedurn = str_replace(array('+', '/', '='), array('_', '-', '.'), base64_encode($urn));

        try {
            $uri = config('oauth_endpoint');

            $client = new \GuzzleHttp\Client();

            $formats[] = array(
                'type' => 'svf',
                'views' => ['2d', '3d']
            );

            $response = $client->request('POST', 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job', [
                'headers' => [
                    'Authorization' => 'Bearer '.Session::get('token'),
                    'Content-Type'  =>  'application/json'
                ],
                'json'    => [
                    'input' => ['urn' => $encodedurn],
                    'output' => [
                        'formats' => $formats
                    ]
                ],
                'on_stats' => function (TransferStats $stats) use (&$url) {
                    $url = $stats->getEffectiveUri();
                }
            ]);
        } catch (RequestException $e) {
            return redirect('/')->with('message', $e->getMessage());
        }

        $content = $response->getBody()->getContents();
        $data = json_decode($response->getBody(), true);

        return Session::get('token');
    }

    /**
     * Get Issues
     *
     * @param $id
     * @return $this
     */
    public function get_issues($id){

        // check if Field User ticket is in the session
        if(Session::has('ticket')){
            $ticket = Session::get('ticket');
        }
        else {
            return redirect('/')->with('message', 'Field user ticket is expired. Please try to login.');
        }

        // check if project id is set in argument
        if($id != null){
            Session::put('current_project', $id);
        }
        else{
            return redirect('/')->with('message', 'Could not find project id.');
        }

        // get Issues by HTTP Request to BIM 360 Field REST API
        try {
            $client = new \GuzzleHttp\Client(['base_uri' => 'https://bim360field.autodesk.com']);

            $response = $client->request('POST', '/fieldapi/issues/v1/list', [
                'json' => [
                    'ticket' => $ticket,
                    'project_id' => $id,
                    'limit' => 20
                ],
                'on_stats' => function (TransferStats $stats) use (&$url) {
                    $url = $stats->getEffectiveUri();
                }
            ]);
        } catch (RequestException $e) {

            return redirect('/')->with('message', $e->getMessage());
        }

        // get response
        $content = $response->getBody()->getContents();
        $data = json_decode($response->getBody(), true);

        return View::make('issues')->with('issues', $data);
    }

    /**
     * Create a new Issue
     *
     * @param Request $request
     * @return $this
     */
    public function create_issue(Request $request){

        // check if Field User ticket is in the session
        if(Session::has('ticket')){
            $ticket = Session::get('ticket');
        }
        else {
            return redirect('/')->with('message', 'Field user ticket is expired. Please try to login.');
        }

        // check if project id and username are in the session
        if(Session::has('current_project') && Session::has('username')){
            $current_project = Session::get('current_project');
            $username = Session::get('username');
        }
        else {
            // error
        }

        // validation check
        $validator = Validator::make($request->all(), [
            'description' => 'required|max:255',
            'status' => 'required|max:255',
            'priority' => 'required|max:255',
            'duedate' => 'required|max:255'
        ]);

        if ($validator->fails()) {
            return redirect('/')
                ->withInput()
                ->withErrors($validator);
        }

        // create issue object
        $issue = array(
            "temporary_id" => "Tmp001",
            "created_by" => $username,
            "fields"=> array(
             array("id"=>"f--description","value"=> $request->input('description')),
             array("id"=>"f--status", "value"=>$request->input('status')),
             array("id"=>"f--priority", "value"=>$request->input('priority')),
             array("id"=>"f--due_date", "value"=>$request->input('duedate'))
            )
        );

        // create a new Issue by HTTP Request to BIM 360 Field REST API
        try {
            $client = new \GuzzleHttp\Client(['base_uri' => 'https://bim360field.autodesk.com']);

            $response = $client->request('POST', '/fieldapi/issues/v1/create', [
                'json' => [
                    'ticket' => $ticket,
                    'project_id' => $current_project,
                    'issues' => '[' . json_encode($issue) . ']'
                ],
                'on_stats' => function (TransferStats $stats) use (&$url) {
                    $url = $stats->getEffectiveUri();
                }
            ]);
        } catch (RequestException $e) {

            return redirect('/')->with('message', $e->getMessage());
        }

        Log::debug(print_r($client, true));

        // get response
        $content = $response->getBody()->getContents();
        $data = json_decode($response->getBody(), true);

        return Redirect::to('/')
            ->with("requestData", $url)
            ->with("responseData", $content)
            ->with("projects", $this->projects)
            ->with("issues", $this->issues)
            ;
    }

}