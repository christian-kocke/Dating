<?php namespace Api\Http\Controllers;

use Auth;
use DB;
use Hash;
use Api\Http\Requests;
use Api\Http\Controllers\Controller;

use Illuminate\Http\Request;

class UserValidationController extends Controller {


	/**
	 * Populate the class attributes.
	 *
	 * @param Request
	 */
	public function __construct(Request $request)
	{
		
		// Assign the value of the current request.
		$this->_request = $request;

		// If the user is authenticated return the instance otherwise return null.
		$this->_user = (Auth::check()) ? Auth::user() : null;
	}

	/**
	 * Check the users password.
	 *
	 * @return Response
	 */
	public function password()
	{
		// Check if the two passwords match.
		$validation = Hash::check($this->_request->input('password'), $this->_user->password);

		// return the result
		return response((string) $validation);
	}

	/**
	 * Check the users email.
	 *
	 * @return Response
	 */
	public function email()
	{
		// Select the id of every user with the email.
		$queryResult = DB::select('select * from '.$this->_request->input('table').' where email = ?', [$this->_request->input('email')]);

		// Count the number of users with this email.
		$numberOfEmails = count($queryResult);

		// return the number of emails in the database that match this email.
		return response($numberOfEmails);
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		//
	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
		//
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
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
		//
	}

}
