<?php namespace Api\Services;

use Api\User;
use Api\Profil;
use Validator;
use Illuminate\Contracts\Auth\Registrar as RegistrarContract;

class Registrar implements RegistrarContract {

	/**
	 * Get a validator for an incoming registration request.
	 *
	 * @param  array  $data
	 * @return \Illuminate\Contracts\Validation\Validator
	 */
	public function validator(array $data)
	{
		return Validator::make($data, [
			'username' 	=> 'required|max:255',
			'email' 	=> 'required|email|max:255|unique:users',
			'dob' 		=> 'required|date',
			'gender' 	=> 'required',
			'password' 	=> 'required|confirmed|min:6',
		]);
	}

	/**
	 * Create a new user instance after a valid registration.
	 *
	 * @param  array  $data
	 * @return User
	 */
	public function create(array $data)
	{
		$user = User::create([
			'username' 	=> $data['username'],
			'email' 	=> $data['email'],
			'dob'		=> $data['dob'],
			'gender'	=> $data['gender'],
			'password' 	=> bcrypt($data['password']),
		]);

		Profil::create([
			'user_id'	=> $user->id
		]);

		return $user;
	}

}
