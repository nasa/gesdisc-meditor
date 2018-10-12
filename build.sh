set -ex

REGISTRY=dev.gesdisc.eosdis.nasa.gov:443

# update visible UI version
version=`cat VERSION`
echo "export const version = '$version'" >! 'ui/src/environments/version.ts'

# build images
docker image build -t $REGISTRY/meditor_ui ./ui
docker image build -t $REGISTRY/meditor_server ./nodejs-server-server
docker image build -t $REGISTRY/meditor_database ./database
docker image build -t $REGISTRY/meditor_proxy ./proxy
docker image build -t $REGISTRY/meditor_notifier ./notifier