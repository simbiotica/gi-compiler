SELECT

  DISTINCT(export_generic_prod_%(table)s_dp.aspectid) AS id,
  aspecttext AS name,
  projectname AS title,
  aspectname,

CASE
WHEN export_generic_prod_%(table)s_dp.depth::text~E'^\\d+$'
THEN export_generic_prod_%(table)s_dp.depth::integer
ELSE 0
END

as depth

FROM export_generic_prod_%(table)s_dp
JOIN export_generic_prod_%(table)s_meta
on export_generic_prod_%(table)s_dp.aspectid=export_generic_prod_%(table)s_meta.aspectid
WHERE answervalue::text is not null
AND answervalue::text <>''
ORDER BY

CASE
WHEN export_generic_prod_%(table)s_dp.depth::text~E'^\\d+$'
THEN export_generic_prod_%(table)s_dp.depth::integer
ELSE  0
END

ASC, export_generic_prod_%(table)s_dp.aspectid ASC
