<?php namespace Api\Services;

use Illuminate\Database\Eloquent\Model;

class Invitation extends Model {

	/*
	 * define the model table.
	 *
	 */
	protected $table = 'invitations';

	/*
	 * define the mass-asssignable fields.
	 *
	 */
	protected $fillable = array('user_id', 'token', 'email');

	/*
	 * define the none-assignable fields.
	 *
	 */
	protected $guarded = array();

	/*
	 * define the primary key.
	 *
	 */
	protected $primaryKey = 'token';
}