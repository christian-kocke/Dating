<?php namespace Api\Http\Controllers;

use Api\Http\Requests;
use Api\Http\Controllers\Controller;
use Invitation;
use Auth;
use Illuminate\Http\Request;
use Mail;

class InvitationController extends Controller {


	/**
	 * The user instance.
	 */
	protected $_user;

	/**
	 * The current request instance.
	 */
	protected $_request;

	/**
	 * The current request instance.
	 */
	protected $_invitation;

	/**
	 * Populate the class attributes.
	 *
	 * @param Request
	 */
	public function __construct(Request $request)
	{
		
		// We assign the value of the current request.
		$this->_request = $request;

		// if the user is authenticated we return the instance otherwise we return null.
		$this->_user = (Auth::check()) ? Auth::user() : null;
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		
	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{

		
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		
		$this->_invitation = Invitation::create([
			"user_id" => $this->_user->id,
			"token" => str_random(20),
			"email" => $this->_request->input('email'),
		]);

		if($this->_invitation)
		{
			Mail::send('emails.invitation', ['user' => $this->_user->username, 'token' => $this->_invitation->token], function($message)
			{
				$message->to($this->_invitation->email, $this->_user->firstname." ".$this->_user->lastname)->subject('Join me on Dating.com !');
			});
		}
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		//
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
		//
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		
	}

}
