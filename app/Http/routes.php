<?php

/*
|--------------------------------------------------------------------------
| Routes File
|--------------------------------------------------------------------------
|
| Here is where you will register all of the routes in an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

/**
 * Top Page
 */
Route::get('/', 'HomeController@index');

/**
 * Get Hub List
 */
Route::get('/hub', 'HomeController@get_hub');

/**
 * Get Project List
 */
Route::get('/projects/{hub_id}', 'HomeController@get_projects');

/**
 * Get Items
 */
Route::get('/items/{project_id}/{folder_id}', 'HomeController@get_items');

/**
 * Get Items
 */
Route::post('/viewer/{urn}', 'HomeController@prepare_viewer');

/**
 * Get Issues
 */
Route::get('/issues/{id}', 'HomeController@get_issues');

/**
 * Create Issue
 */
Route::post('/issue', 'HomeController@create_issue');

/**
 * Authentication
 */
Route::post('/authenticate', 'HomeController@authenticate');

/**
 * Get Access Token
 */
Route::get('/token', 'HomeController@get_3_legged_token');

/**
 * Get 3 Legged Token
 */
Route::get('/oauth/callback', 'HomeController@get_access_token');

/**
 * Login
 */
Route::get('/login', 'HomeController@login');

/**
 * Logout
 */
Route::get('/logout', 'HomeController@logout');