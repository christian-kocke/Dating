<?php namespace Api\Http\Controllers;

use Auth;
use DB;
use File;
use Image;
use Api\Http\Requests;
use Api\Http\Controllers\Controller;

use Illuminate\Http\Request;

class PhotosController extends Controller {

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

		$this->_path = '/app/imgDrop/photos/user_'.$this->_user->id.'/';
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		$photos = DB::select('select * from photos where user_id = ?', [$this->_user->id]);
		
		return response()->json($photos);
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
		if($this->_request->file('file')->isValid())
		{
			if ( ! File::isDirectory($this->_path) and $this->_path) @File::makeDirectory($this->_path);
			$fileName = $this->_request->header('name').".".$this->_request->file('file')->guessExtension();
			$filePath = $this->_path.''.$fileName;
			$thumbnailPath = $this->_path.'84x84_crop/'.$fileName;
			if($this->_request->file('file')->move($_SERVER['DOCUMENT_ROOT'].$this->_path, $fileName))
			{
				DB::insert('insert into photos (user_id, path, thumbnail_path, description) values (?, ?, ?, ?)', [$this->_user->id, $filePath, $thumbnailPath, "Add a description"]);
				Image::thumb($filePath, 84);
				Image::compress($filePath);
				return response($filePath);	
			}
		}
		return response("upload failure.", 441);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		$photos = DB::select('select * from photos where user_id = ?', [$id]);
		
		return response()->json($photos);
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
