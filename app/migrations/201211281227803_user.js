migration.up = function(db) {
	db.createTable({
		"columns": {
			"username":"string",
			"password":"string"
		},
		"adapter": {
			"type": "sql",
			"collection_name": "user"
		}
	});
};

migration.down = function(db) {
	db.dropTable("user");
};
