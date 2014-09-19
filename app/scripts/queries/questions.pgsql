SELECT
  DISTINCT(aspectid) AS id,
  aspecttext AS name,
  projectname AS title
FROM export_generic_prod_%(table)s_dp
ORDER BY aspectid ASC
