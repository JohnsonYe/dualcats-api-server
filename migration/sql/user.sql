create table users (
	id serial primary key,
	email varchar(50) unique not null,
	password varchar(255) unique not null,
	name varchar(255) not null,
    is_active boolean not null default true,
	created_at timestamp default current_timestamp,
	modified_at timestamp default current_timestamp
);