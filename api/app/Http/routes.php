<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::post('/user/auth', 'UserController@authenticate');
Route::post('user/validation/email', 'UserValidationController@email');
Route::post('user/activate', 'UserController@activate');
Route::resource('user','UserController', ['only' => ['store', 'index']]);

Route::group(['middleware' => ['auth']], function()
{
	Route::post('user/validation/password', 'UserValidationController@password');
	Route::post('user/upload', 'UserController@setPicture');
	Route::get('user/get', 'UserController@getPicture');
	Route::get('user/logout', 'UserController@logout');
	Route::post('api/article/display', 'ArticleController@index');
	Route::post('api/article/setPicture', 'ArticleController@setPicture');
	Route::resource('api/article','ArticleController');
	Route::resource('user','UserController', ['except' => ['store', 'index']]);	

});


Route::controllers([
	'password' => 'Auth\PasswordController',
]);
