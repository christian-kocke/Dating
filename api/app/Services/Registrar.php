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
			'email' 	=> $data['email'],
			'username'	=> $data['username'],
			'password' 	=> bcrypt($data['password']),
		]);

		Profil::create([
			'user_id'	=> $user->id,
			'username' 	=> $data['username'],
			'dob'		=> $data['dob'],
			'gender'	=> $data['gender'],
			'profil_path' => ($data['gender'] === "male") ? '/app/img/male.png' : '/app/img/female.png'
		]);

		return $user;
	}

}
