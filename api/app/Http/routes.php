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

Route::post('user/auth', 'UserController@authenticate');
Route::post('user/activate', 'UserController@activate');
Route::post('user/validation/email', 'UserValidationController@email');

Route::resource('user','UserController', ['only' => ['store', 'index']]);

Route::group(['middleware' => ['auth']], function()
{
	Route::post('user/validation/password', 'UserValidationController@password');
	Route::get('user/logout', 'UserController@logout');
	Route::resource('user/file', 'UserFileController');
	Route::resource('user/profil', 'ProfilController');
	Route::resource('user','UserController', ['except' => ['store', 'index']]);	

});


Route::controllers([
	'password' => 'Auth\PasswordController',
]);
