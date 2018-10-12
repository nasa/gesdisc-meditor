set -ex

REGISTRY=dev.gesdisc.eosdis.nasa.gov:443

# update visible UI version
version=`cat VERSION`
echo "export const version = '$version'" > './ui/src/environments/version.ts'

# build images
docker image build -t $REGISTRY/meditor_ui ./ui --no-cache
docker image build -t $REGISTRY/meditor_server ./nodejs-server-server --no-cache
docker image build -t $REGISTRY/meditor_proxy ./proxy --no-cache
docker image build -t $REGISTRY/meditor_notifier ./notifier --no-cache