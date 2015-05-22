<?php namespace Api;

use Illuminate\Database\Eloquent\Model;

class Invitation extends Model {

	/*
	 * define the model table.
	 *
	 */
	protected $table = 'invitation';

	/*
	 * define the mass-asssignable fields.
	 *
	 */
	protected $fillable = array('user_id', 'token');

	/*
	 * define the none-assignable fields.
	 *
	 */
	protected $guarded = array();
}