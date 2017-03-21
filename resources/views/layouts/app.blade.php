<!doctype html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0">

    <title>BIM 360 API with IoT Demo</title>

    <link href="https://fonts.googleapis.com/css?family=Raleway:300,400,500,700" rel="stylesheet" type="text/css">
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" rel="stylesheet" type="text/css">

    <link rel="stylesheet" href="https://developer.api.autodesk.com/viewingservice/v1/viewers/style.min.css" type="text/css">
    <link rel="stylesheet" href="https://developer.api.autodesk.com/viewingservice/v1/viewers/A360.css" type="text/css">
    
    <link rel="stylesheet" type="text/css" href="/css/app.css"/>
    <link rel="stylesheet" type="text/css" href="/css/viewer.css"/>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <script src="https://js.pusher.com/3.2/pusher.min.js"></script>
    
    <script src="https://developer.api.autodesk.com/viewingservice/v1/viewers/three.min.js"></script>
    <script src="https://developer.api.autodesk.com/viewingservice/v1/viewers/viewer3D.min.js"></script>
    <script src="https://developer.api.autodesk.com/viewingservice/v1/viewers/Autodesk360App.js"></script>

    <script src="/js/global.js"></script>
    
</head>
<body>
    <!-- Header Contents -->
    <div class="header-container container">
        <nav class="navbar navbar-default navbar-fixed-top">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    
                    {{--<a class="navbar-brand" href="/">BIM 360 API with Raspberry Pi 3</a>--}}
                    <img src="/img/forge_logo.png" class="forge-logo" />
                    <a class="navbar-brand" href="/">Autodesk Forge Demo</a>
                    
                </div>

                <div id="navbar" class="navbar-collapse collapse">
                    <div class="navbar-form navbar-right">
                        @if(Session::has('token'))
                            <ul class="nav navbar-nav">
                                <li class="user-profile">
                                    <div class="user-name">{{$profile['firstName']}} {{$profile['lastName']}}</div>
                                    <div class="user-email">{{$profile['emailId']}}</div>
                                    <div id="session-token" style="display:none" data-session-token={{ Session::get('token') }}></div>
                                </li>
                            </ul>
                       
                            <button id="logoutbtn" type="button" class="btn btn-default">Logout</button>
                        @else
                            <button type="button" class="btn btn-default" id="loginbtn" data-client-id={{ $client_id }}>Login</button>
                        @endif
                    </div>
                </div>
            </div>
        </nav>
    </div>

    <!-- Main contents will be inserted here -->
    @yield('content')

    <!-- Footer Contents -->
    <div class="footer-container">
       <footer class="footer">
        <div class="col-sm-offset-2 col-sm-8">
            <div class="well well-sm request-box" id="request-body">
                {{ Session::get('requestData') }}
            </div>
            <div class="well well-sm response-box" id="response-body">
                {{ Session::get('responseData') }}
            </div>
        </div>
       </footer>
    </div>
    
    <!-- Login Modal contents will be inserted here -->
    {{--@yield('login-modal')--}}
    {{--<div class="modal fade" tabindex="-1" role="dialog" id="loginModal">--}}
        {{--<div class="modal-dialog">--}}
            {{--<div class="modal-content">--}}
                {{--<div class="modal-header">--}}
                    {{--<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>--}}
                    {{--<h4 class="modal-title">Autodesk OAuth Login</h4>--}}
                {{--</div>--}}
                {{--<div class="modal-body">--}}
                    {{--<a style="display: none" id="autodesk-login-url" href="https://developer.api.autodesk.com/authentication/v1/authorize?response_type=code&client_id={{ $client_id }}&redirect_uri=https%3A%2F%2Fbim360-iot.herokuapp.com%2Foauth%2Fcallback&scope=data:read">Login</a>--}}
                    {{--<iframe id='autodesk-login-iframe'></iframe>--}}
                {{--</div>--}}
            {{--</div>--}}
        {{--</div>--}}
    {{--</div>        --}}

    <!-- Issue Modal contents will be inserted here -->
{{--    @yield('issue-modal')--}}

</body>
</html>