<?php namespace Api\Http\Controllers;

use WingNote;
use Api\Http\Requests;
use Api\Http\Controllers\Controller;

use Illuminate\Http\Request;

class WingNoteController extends Controller {


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
		
		// Assign the value of the current request.
		$this->_request = $request;

	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index($userId)
	{
		$res = WingNote::where('receiver_id', $userId);
		error_log(print_r($res, true));
		return response()->json($res);
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

		$res = WingNote::where('emitter_id', $userId)->where('receiver_id', $this->_request->receiver_id)->get();
		if(count($res) === 0)
		{
			WingNote::create([
				'text' => $this->_request->text,
				'emitter_id' => $userId,
				'receiver_id' => $this->_request->receiver_id
			]);

			return response(1);
		}
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($userId, $wingNoteId)
	{
		return response()->json(WingNote::find($wingNoteId));
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($userId, $wingNoteId)
	{
		WingNote::find($wingNoteId);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($userId, $wingNoteId)
	{
		return response(WingNote::find($wingNoteId)->delete());
	}

}
