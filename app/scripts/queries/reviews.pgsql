SELECT
  aspectid,
  targetid,
  reviewuserrole,
  reviewopinion,
  reviewanswervalue,
  reviewcomments
from
  export_generic_prod_107_dp
where
  aspectid in (%(question)s)
  and targetid in (%(target)s)
  and reviewopinion != 1
