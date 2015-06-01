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
	 * @param  int  $userId
	 *
	 * @return Response
	 */
	public function index($userId)
	{
		$photos = DB::select('select * from photos where user_id = ?', [$userId]);
		
		return response()->json($photos);
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  int  $userId
	 *  
	 * @return Response
	 */
	public function store($userId)
	{
		if($this->_request->file('file')->isValid())
		{
			if ( ! File::isDirectory($this->_path) and $this->_path) @File::makeDirectory($this->_path);
			$fileName = $this->_request->header('name').".".$this->_request->file('file')->guessExtension();
			$filePath = $this->_path.''.$fileName;
			$thumbnailPath = $this->_path.'84x84_crop/'.$fileName;
			if($this->_request->file('file')->move($_SERVER['DOCUMENT_ROOT'].$this->_path, $fileName))
			{
				DB::insert('insert into photos (user_id, path, thumbnail_path, description) values (?, ?, ?, ?)', [$userId, $filePath, $thumbnailPath, "Add a description"]);
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
	 * @param  int  $userId
	 * @param  int  $photoId 
	 * @return Response
	 */
	public function show($userId, $photoId)
	{
		//
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $userId
	 * @param  int  $photoId 
	 * @return Response
	 */
	public function update($userId, $photoId)
	{
		if(DB::update('update photos set description = ? where id = ?', [$this->_request->description, $photoId])) return response(1);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $userId
	 * @param  int  $photoId 
	 * @return Response
	 */
	public function destroy($userId, $photoId)
	{
		if(DB::update('delete from photos where id = ?', [$photoId])) return response(1);
	}

}
