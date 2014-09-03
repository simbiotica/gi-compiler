SELECT DISTINCT(targetid), targetname
FROM export_generic_prod_%(table)s_dp
ORDER BY targetname ASC
