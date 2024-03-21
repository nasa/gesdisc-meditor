#!/bin/bash
# Returns value of "version" field from package.json.
# Assumes npm and correct scope of desired package.json (uses npm defaults).

get_version() {
	local version=$(npm pkg get version)

	# Docker tag requires the value to not be surrounded in double-quotes.
	# fails: "1.2.3"
	# passes: 1.2.3
	echo $version | awk -F'"' '{print $2}'
}

get_version
