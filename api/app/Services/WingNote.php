<?php namespace Api\Services;

use Illuminate\Database\Eloquent\Model;

class WingNote extends Model {

	/*
	 * define the model table.
	 *
	 */
	protected $table = 'wingnotes';

	/*
	 * define the mass-asssignable fields.
	 *
	 */
	protected $fillable = array('text', 'emitter_id', 'receiver_id');

	/*
	 * define the none-assignable fields.
	 *
	 */
	protected $guarded = array('id');

}