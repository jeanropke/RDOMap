# Updates all language files from our Crowdin project.
# Requires a valid crowdin.ymt file to be present in the root.

cd ..
{
  git pull

  # Lang files.
  crowdin download -b RDO
  crowdin upload sources -b RDO
  crowdin upload translations -b RDO

  # Cont files.
  node "crowdin/index.js"

  # Commit.
  git add .
  git commit -m "Automatic language update."
  git push
} >"logs/lang-$(date +"%Y-%m-%d_%H-%M").log" 2>&1
