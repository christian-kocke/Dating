<?php namespace Api\Http\Controllers;

use Auth;
use Hash;
use DB;
use Mail;
use File;
use Cookie;
use Session;
use Utilities;
use Symfony\Component\HttpFoundation\Cookie as SymfonyCookie;
use Illuminate\Contracts\Auth\Registrar;
use Api\Http\Requests;
use Api\Http\Controllers\Controller;

use Illuminate\Http\Request;

class UserController extends Controller {


	/**
	 * The user instance.
	 */
	protected $_user;

	/**
	 * The user instance.
	 */
	protected $_profil;

	/**
	 * The current request instance.
	 */
	protected $_request;

	/**
	 * The registrar instance.
	 */
	protected $_registrar;


	/**
	 * Populate the class attributes.
	 *
	 * @param Request
	 * @param Registrar
	 */
	public function __construct(Request $request, Registrar $registrar)
	{
		// Assign the registrar instance.
		$this->_registrar = $registrar;

		// Assign the value of the current request.
		$this->_request = $request;

		// If the user is authenticated return the instance otherwise return null.
		$this->_user = (Auth::check()) ? Auth::user() : null;

		$this->_profil = (Auth::check()) ? DB::select('select * from profils where user_id = ?', [$this->_user->id])[0] : null;
	}

	/**
	 * Create a new user.
	 *
	 * @return Response
	 */
	public function store()
	{	
		$validator = $this->_registrar->validator($this->_request->all());
		if($validator->passes())
		{
			$this->_user = $this->_registrar->create($this->_request->all());
			
			$token = str_random(20);
			Mail::send('emails.activation', ['token' => $token], function($message)
			{
				$message->to($this->_user->email, $this->_user->firstname." ".$this->_user->lastname)->subject('Activate your account !');
			});
				
			return response(DB::update('update users set activation_token = ? where id = ?', [$token, $this->_user->id]));
			
		}
		return response(0);
	}

	public function activate()
	{
		$id = DB::select('select id from users where activation_token = ?', [$this->_request->input('token')]);
		if(count($id) === 1)
		{
			return response(DB::update('update users set activation_token = NULL where id = ?', [$id[0]->id]));
		}
		return response(0, 464);
	}
	/**
	 * Authenticate the user.
	 *
	 * @return Response
	 */
	public function authenticate()
	{
		if(Auth::attempt(['email' => $this->_request->input('email'), 'password' => $this->_request->input('password')], $this->_request->input('remember')))
		{
			$this->_user = Auth::user();
			if(!$this->_user->activation_token)
			{
				$this->_profil = DB::select('select * from profils where user_id = ?', [$this->_user->id])[0];
				return response()->json(["id" => csrf_token(), "user" => $this->_user, "profil" => $this->_profil]);
			}
			Auth::logout();
			$this->_user = null;
			return response(465, 465);
		}
		return response("Echec");
	}

	public function logout()
	{
		return response(Auth::logout());
	}
	/**
	 * Display the specified resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		if(Auth::check())
		{
			return response()->json(["id" => csrf_token(), "user" => $this->_user, "profil" => $this->_profil]);
		}
		return response(0);
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		//
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{

	}

	/**
	 * Search for ressources.
	 *
	 * 
	 * @return Response
	 */
	public function search()
	{
		$filters = 'user_id!=?&';
		$arguments = [$this->_user->id];
		foreach ($this->_request->all() as $column => $filter) {
			if(Utilities::array_keys_numeric($filter)) {
				$filters .= $column.'@?&?';
				$arguments[] = $filter[0];
				$arguments[] = $filter[1];
			} else {
				foreach ($filter as $key => $value) {
					if($value) {
						$arguments[] = $key;
						$filters .= $column.'=?'.'|';
					}
				}
			}
			$filters = trim($filters, '|');
			$filters .= (Utilities::filter_in_array($filter)) ? '&' : '';
			

		}
		$filters = Utilities::str_replace_sql($filters);
		$results = DB::select('select * from profils where '.$filters, $arguments);
		return (count($results)) ? response()->json($results) : 0;
		
	}


	/**
	 * Invite someone.
	 *
	 * 
	 * @return Response
	 */
	public function invite()
	{
		Mail::send('emails.invitation', ['user' => $this->_user->username], function($message)
		{
			$message->to($this->_request->input('email'), $this->_user->firstname." ".$this->_user->lastname)->subject('Join me on Dating.com !');
		});
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		if((($cpt = count($this->_request->input())) > 0 ))
		{
			if(count(array_intersect_key($this->_request->all(), array('username' => "", 'current' => "", 'password' => "", 'confirm' => ""))) === count($this->_request->all()))
			{
				if($cpt == 1)
				{
					$username = $this->_request->input('username');
					$arg[] = $username;
					$query = "update users set username = ? where id = ".$this->_user->id;
				} else {
					$current = $this->_request->input('current');
					$password = $this->_request->input('password');
					$confirm = $this->_request->input('confirm');
					
					if(!Hash::check($current, $this->_user->password) || $password !== $confirm)
					{
						return response("Wrong password.", 460);
					} else 
					{
						$arg[] = bcrypt($password);
						$query = "update users set password = ? where id = ".$this->_user->id;
					}
				}

				if(DB::update($query, $arg))
				{
					return response("1");
				}
			}
			return response("Profil Update Failed", 461);
		}
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		if(Auth::check()) 
		{
			if(count(glob($_SERVER['DOCUMENT_ROOT'].'/app/imgDrop/profilPictures/user_'.$id.'.*')) > 0)
			{
				File::delete(glob($_SERVER['DOCUMENT_ROOT'].'/app/imgDrop/profilPictures/user_'.$id.'.*')[0]);
			}

			$path_directory = $_SERVER['DOCUMENT_ROOT'].'/app/imgDrop/photos/user_'.$id;

			try {
				DB::delete("delete from photos where user_id = ?", [$id]);
				DB::delete("delete from profils where user_id = ?", [$id]);
				DB::delete("delete from users where id = ?", [$id]);
			} catch (Exception $e) {
				return response($e->getMessage());
			}

			if(File::isDirectory($path_directory)) File::deleteDirectory($path_directory);

			return response("Delete account success !");
		}
	}
}