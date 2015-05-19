<?php namespace Api;

use Illuminate\Database\Eloquent\Model;

class Profil extends Model {

	/*
	 * define the model table.
	 *
	 */
	protected $table = 'profils';

	/*
	 * define the mass-asssignable fields.
	 *
	 */
	protected $fillable = array('user_id', 'username', 'profil_path', 'location');

	/*
	 * define the none-assignable fields.
	 *
	 */
	protected $guarded = array('id');
}
