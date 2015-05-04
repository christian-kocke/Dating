<?php

use Illuminate\Database\Seeder;
use \Api\User;

 
class UsersTableSeeder extends Seeder {
 
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
    DB::table('users')->delete();
 
        User::create(array(
            'firstname'     => 'christian',
            'lastname'      => 'kocke',
            'username'      => 'christian',
            'email'         => 'christian@kocke.fr',
            'password'      => Hash::make('password') //hashes our password nicely for us
 
        ));
 
    }
 
}