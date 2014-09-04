SELECT
  DISTINCT(targetid) AS id,
  targetname AS name
FROM export_generic_prod_%(table)s_dp
ORDER BY targetname ASC
