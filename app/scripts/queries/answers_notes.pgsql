SELECT
dnorm.targetid,
dnorm.targetname,
aspecttext,
dnorm.aspectid,
criterias.criterias,
--reviewanswervalue,
father,
fatherdescription,
fathers.datatype,
answerscore,
answervalue::text,
level,
answersourcedescription,
answercomments,
notes.notes,
criterias.aspectname,
CASE
WHEN depth::text~E'^\\d+$'
THEN depth::integer
ELSE 0
END
as depth

FROM export_generic_prod_%(table)s_dp dnorm

left join
-- question+criterias SUB-select
(SELECT aspectid, aspectname,
(SELECT
array(SELECT a.choice ||'|'||a.criteria
      FROM export_generic_prod_%(table)s_meta a
      where a.aspectid = b.aspectid
      order by choice
      )) as criterias
FROM export_generic_prod_%(table)s_meta b
GROUP BY aspectid, criterias, aspectname
-- ORDER BY targetid

) as criterias
on
dnorm.aspectid = criterias.aspectid

left join
-- notes sub-select
(select
  n.aspectid,
  n.targetid,
  notedata1 || notedata2 as notes
from export_generic_prod_%(table)s_notes n,
 export_generic_prod_%(table)s_dp p

where n.aspectid = p.aspectid
  and n.targetid = p.targetid
  %(notes_targets)s
  %(notes_questions)s
group by
  n.notedata1, n.notedata2, n.aspectid, n.targetid

) as notes
on
  notes.aspectid = dnorm.aspectid


left join

-- question+father SUB-select
(SELECT aspectid, datatype,
(SELECT aspectid as fatherid FROM export_generic_prod_%(table)s_meta a WHERE b.aspectid = ANY(regexp_split_to_array(memberaspects, '[|]')) ) as father,
(SELECT aspectdescription as fatherdescription FROM export_generic_prod_%(table)s_meta a WHERE b.aspectid = ANY(regexp_split_to_array(memberaspects, '[|]')) ) as fatherdescription
FROM export_generic_prod_%(table)s_meta b GROUP BY father, b.aspectid, b.datatype) as fathers
on dnorm.aspectid=fathers.aspectid

where answervalue::text is not null
AND answervalue::text <>''

%(targets)s
%(questions)s

GROUP BY dnorm.targetid,
dnorm.targetname,
aspecttext,
dnorm.aspectid,
criterias.criterias,
--reviewanswervalue,
father,
fatherdescription,
fathers.datatype,
answerscore,
answervalue,
level,
depth,
answersourcedescription,
answercomments,
criterias.aspectname,
notes

order by
CASE
WHEN depth::text~E'^\\d+$'
THEN depth::integer
ELSE 0
END ASC, father asc,aspectid asc
