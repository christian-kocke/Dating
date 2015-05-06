<?php namespace Api\Http\Controllers;

use Auth;
use Hash;
use DB;
use Mail;
use Cookie;
use Session;
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
			if($this->_user->id)
			{
				$token = str_random(20);
				Mail::send('emails.activation', ['token' => $token], function($message)
				{
					$message->to($this->_user->email, $this->_user->firstname." ".$this->_user->lastname)->subject('Activate your account !');
				});	
				return response(DB::update('update users set activation_token = ? where id = ?', [$token, $this->_user->id]));
			}
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
				return response()->json(["id" => csrf_token(), "user" => $this->_user]);
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
			return response()->json(["id" => csrf_token(), "user" => $this->_user]);
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
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		if((($cpt = count($this->_request->input())) > 0 ) && Auth::check())
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
			if(DB::delete("delete from users where id = ?", [$id])) {
				return response("1");
			}
		}
		return response("Delete Account Failed", 462);
	}


	public function getProfil(Request $request)
	{
		if(Auth::check()) {
			$infos = DB::select('select p.*, u.dob age from profils p inner join users u on u.id = p.user_id where user_id = ?',[$this->_request->input('id')]);
			$infos[0]->age = date("Y") - substr($infos[0]->age, 0, 4);
			return response()->json($infos[0]);
		}
	}


}
