SELECT DISTINCT(aspectid), aspecttext
FROM export_generic_prod_%(table)s_dp
ORDER BY aspectid ASC
