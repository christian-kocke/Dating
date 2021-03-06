<?php namespace Api\Http\Controllers;

use DB;
use Auth;
use Api\Http\Requests;
use Api\Http\Controllers\Controller;

use Illuminate\Http\Request;

class ProfilController extends Controller {


	/**
	 * The user instance.
	 */
	protected $_user;

	/**
	 * The current request instance.
	 */
	protected $_request;

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
		$infos = DB::select('select * from profils where user_id = ?',[$id]);
		return response()->json($infos[0]);	
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		if(count(array_intersect_key($this->_request->all(), array('username' => "", 'profil_path' => "", 'location' => "", 'height' => "", 'skin' => "", 'eyes' => "", 'hair' => "", 'weight' => "", 'whyHere' => "", 'aboutMe' => "", 'id' => ""))) === count($this->_request->all()))
		{
			$set = '';
			foreach ($this->_request->all() as $key => $value) {
				$set .= "{$key}=? ";
			}
			$set = str_replace(" ", ", ", trim($set));
			DB::update("UPDATE profils SET {$set} WHERE user_id = ?", array_merge(array_values($this->_request->all()), [$id]));
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
		//
	}

}
