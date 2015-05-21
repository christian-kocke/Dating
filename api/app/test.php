<?php

	$filters = '';
	function search()
	{
		$test = [
			'gender' => [
				'male' => true,
				'female' => true
			],
			'skin' => [
				'black' => true,
				'white' => false
			],
			'height' => [
				0 => 140,
				1 => 200
			]
		];
		$filters = '';
		foreach ($test as $column => $filter) {
			if(array_keys_numeric($filter)) {
				$filters .= $column.'@'.$filter[0].'&'.$filter[1];
			}else{
				foreach ($filter as $key => $value) {
					$filters .= ($value) ? $column.'='.$key.'|' : '';
				}
			}
			$filters = trim($filters, '|');
			$filters .= (array_search(true, $filter, true)) ? '&' : '';

		}
		$filters = str_replace_sql($filters);
		echo $filters;
	}

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

search();