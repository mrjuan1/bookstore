#!/bin/sh -e

if [ -e .env ]; then
  source ./.env
elif [ -e ../.env ]; then
  source ../.env
else
  echo "Couldn't find a usable .env file."
  echo -e "If you've already configured your .env file, please make sure you're running this script from either the repo's root directory, or the db directory in the repo's root.\n"
  exit 1
fi

export CREATE_MIGRATIONS_USER_QUERY="CREATE ROLE \"$DB_MIGRATIONS_USER_USERNAME\" LOGIN ENCRYPTED PASSWORD '$DB_MIGRATIONS_USER_PASSWORD' CREATEDB CREATEROLE;"
export CREATE_DATABASE_QUERY="CREATE DATABASE \"$DB_NAME\";"

if [ "$DB_TYPE" != "postgres" ]; then
  echo -e "This script only supports postgres. You're going to have to either switch to postgres and re-run this script, or you're going to have to run some queries manually on your DB of choice.\n"

  echo "In the case of the latter, run the following query as the DB's root user to create the migrations user:"
  echo -e "$CREATE_MIGRATIONS_USER_QUERY\n"

  echo "Then login as the \"$DB_MIGRATIONS_USER_USERNAME\" user created above and run the following query:"
  echo -e "$CREATE_DATABASE_QUERY\n"

  exit 0
fi

show_usage() {
  echo "Usage: $0 [<option(s)...>] [<db root user>]"
  echo "Options:"
  echo "  --help  -h  Show this message"
  echo "  --clear -c  Drop the DB and the migrations user"
  echo "Assumes db root user us \"root\" if not specified"
  echo ""
}

if [ -z "$1" ]; then
  user="root"
fi

get_db_root_password() {
  echo -n "Enter DB $user user's password: "
  read -s PGPASSWORD
  export PGPASSWORD
  echo -e "\n"
}

drop_all() {
  if [ -z "$1" ]; then
    user="root"
  fi

  get_db_root_password

  echo "Dropping database..."
  psql -h "$DB_HOST" -p $DB_PORT -U "$user" -d postgres -c "DROP DATABASE \"$DB_NAME\";"
  echo ""

  echo "Dropping migrations user..."
  psql -h "$DB_HOST" -p $DB_PORT -U "$user" -d postgres -c "DROP ROLE \"$DB_MIGRATIONS_USER_USERNAME\";"
  echo ""

  echo "Dropping api user if it still exists..."
  psql -h "$DB_HOST" -p $DB_PORT -U "$user" -d postgres -c "DROP ROLE IF EXISTS \"$DB_API_USER_USERNAME\";"
  echo ""

  unset PGPASSWORD
  echo -e "Done.\n"

  exit 0
}

for arg in $@; do
  case "$arg" in
  "--help" | "-h")
    show_usage
    exit 0
    ;;
  "--clear" | "-c")
    drop_all "$2"
    ;;
  esac
done

get_db_root_password

echo "Creating migrations user..."
psql -h "$DB_HOST" -p $DB_PORT -U "$user" -d postgres -c "$CREATE_MIGRATIONS_USER_QUERY"
echo ""

echo "Creating database..."
export PGPASSWORD="$DB_MIGRATIONS_USER_PASSWORD"
psql -h "$DB_HOST" -p $DB_PORT -U "$DB_MIGRATIONS_USER_USERNAME" -d postgres -c "$CREATE_DATABASE_QUERY"
echo ""

echo -e "Done.\n"
