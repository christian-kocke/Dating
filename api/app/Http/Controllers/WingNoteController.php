<?php namespace Api\Http\Controllers;

use WingNote;
use Api\Http\Requests;
use Api\Http\Controllers\Controller;

use Illuminate\Http\Request;

class WingNoteController extends Controller {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index($userId)
	{
		return response()->json(WingNote()->)
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
	public function store($userId)
	{
		$wingNote = WingNote::create([
			'text' => $this->_request->text,
			'emitter_id' => $userId,
			'receiver_id' => $this->request->receiver_id
		]);

		return response(true);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($userId, $wingNoteId)
	{
		return response()->json(WingNote::find($id));
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($userId, $wingNoteId)
	{
		WingNote::find($id);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($userId, $wingNoteId)
	{
		return response(WingNote::find($id)->delete());
	}

}
