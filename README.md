# [`GIS Project`] Bangladesh Aid Distribution Mapping

Course group project for `INF: Geographic Information Systems` at the
University of Konstanz, winter term 2020/2021.

## Substantial motivation

- This is a course assignment.
- TODO: write summary from project proposal doc.

## Infrastructure overview

Following the general layout advocated by Paul Ramsey / CrunchyData, this
project branch aims to follow the following recommendations:

- Heavily rely on PostgreSQL / PostGIS for computation and data preparation, e.g.
  by implementing logic etc. in SQL functions.
- Use a lightweight micro service for vector feature serving, namely
  `pg_featureserv`.
- Start with a simple frontend layer, iterate on adding more features there.

From CrunchyData, the general layout can be schematically represented by the
following figure.

![](https://info.crunchydata.com/hs-fs/hubfs/Crunchy%20Spatial_Spatial%20Diagram%20(1).png?width=692&name=Crunchy%20Spatial_Spatial%20Diagram%20(1).png)



## Setup and replication

_Note:_ 
- this workflow might need adaption for non-`*nix` systems.
- the `PG_URI` variable was composed in `env/project.env`. Otherwise
 set the database connection details the usual way.
- it is assumed that the commands are executed relative in the repository root
  directory.

### Define credentials and env variables

1. Copy the template file for project variables: 
    `cp env/template_project.env env/project.env`
2. Fill in the credentials etc. in the newly created file. Make sure it
    does not end up on GH (given that it the database could be exposed to
    the web).
3. Expose the credential variables to your system environment: `source env/project.env`


### Spin the stack up

 1. Make sure no old Docker volumes exist: `docker volume ls`. If there are
    old ones that might be non-desirable, remove them in order to get a
    fresh instance.
 2. Run `docker-compose -p osm up`, whereby the `-p` argument just provides a
     convenient prefix to the containers and networks, etc.
 3. Assure in the console output that everyting went well.


### Import data

- If you restore the database from a backup file, do something like
  `gunzip -c data-backup/<backup-file>.sql.gz | psql ${PG_URI}`
- Otherwise, make sure all the ready-to-import data is in place, and
  run `bash data-research/import_data.sh`. You might need to supply
  `PG_PASSWORD` interactively.

The final database schema should be of the following form:

TODO: Create schema graphic.


**Check if everything is up in place:**

- As long as the frontend is not fully available, checkout `localhost:9000`,
 where the landing page of `pg_featureserv` is located.
   
## Contribution 

Organized with GH issue tracker and ZenHub, with the following definitions:

* **Issue:** Single task / user story, with limited scope and clear description
    of what should be done. Can be assigned to one or more developers.
* **Epic:** A group of (topically) similar issues. An epic is managed by one
  person that tracks the progress on the individual issues.
 * **Milestone:** weekly/biweekly sprint, with a given target definition.


