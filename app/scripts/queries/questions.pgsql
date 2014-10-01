--SELECT
--  DISTINCT(aspectid) AS id,
--  aspecttext AS name,
--  projectname AS title
--FROM export_generic_prod_%(tabl_dp
--ORDER BY aspectid ASC


SELECT

  DISTINCT(export_generic_prod_%(table)s_dp.aspectid) AS id,
  aspecttext AS name,
  projectname AS title,
  aspectname,

CASE 
WHEN export_generic_prod_%(table)s_dp.depth~E'^\\d+$' 
THEN export_generic_prod_%(table)s_dp.depth::integer 
ELSE 0 
END
as depth
	
FROM export_generic_prod_%(table)s_dp
JOIN export_generic_prod_%(table)s_meta
on export_generic_prod_%(table)s_dp.aspectid=export_generic_prod_%(table)s_meta.aspectid
WHERE answervalue is not null
AND answervalue <>''
ORDER BY CASE 
WHEN export_generic_prod_%(table)s_dp.depth~E'^\\d+$' 
THEN export_generic_prod_%(table)s_dp.depth::integer 
ELSE 0 
END ASC, export_generic_prod_%(table)s_dp.aspectid ASC