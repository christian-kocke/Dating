<?php namespace Api\Services;

class Utilities {

	public function array_keys_numeric ($array) {
		foreach ($array as $a => $b) {
		    if (!is_int($a)) {
		        return false;
		    }
		}
		return true;
	}

	public function str_replace_sql ($request) {
		$request = trim($request, '&\@\|');
		$request = str_replace("|", " OR ", $request);
		$request = str_replace("&", " AND ", $request);
		$request = str_replace("@", " BETWEEN ", $request);
		return $request;
	}

	public function filter_in_array ($array) {
		return (array_search(true, $array, true) || (array_filter($array, 'is_int') === $array) || (array_filter($array, 'is_string') === $array));
	}
}
