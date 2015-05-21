<?php namespace Api;

	function array_keys_numeric ($array) {
		foreach ($array as $a => $b) {
		    if (!is_int($a)) {
		        return false;
		    }
		}
		return true;
	}

	function str_replace_sql ($request) {
		$request = trim($request, '&\@\|');
		$request = str_replace("|", " OR ", $request);
		$request = str_replace("&", " AND ", $request);
		$request = str_replace("@", " BETWEEN ", $request);
		return $request;
	}