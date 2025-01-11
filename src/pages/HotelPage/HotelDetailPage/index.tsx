import { useMemo } from 'react';

import { useRequest } from 'ahooks';
import { useParams } from 'react-router-dom';
import { Amenity } from '@ahomevilla-hotel/node-sdk';

import { ROUTE_PATH } from '@/routes/route.constant';
import { getBranchDetailService } from '@/services/branches';
import { useBreadcrumbStore } from '@/stores/breadcrumbs/useBreadcrumbStore';
import LoadingSection from '@/components/Common/LoadingSection';
import ImageGalleryCarousel from '@/components/Common/ImageGalleryCarousel';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Armchair, MapPin, PencilLine, Plus } from 'lucide-react';
import AmenityBadge from '@/components/Common/AmenityDisplay/AmenityBadge';
import { DialogCustom } from '@/components/Common/CustomDialog';
import { UpdateAmenitiesForm } from './UpdateAmenitiesForm';
import { getAmenitiesService } from '@/services/amenities';
import { Option } from '@/components/ui/multiple-selector';
import { UpdateNearByForm } from './UpdateNearByForm';
import { RoomDetailSection } from './RoomDetailSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RoomDetailPage = () => {
  const params = useParams<{ slug: string }>();
  const { setBreadcrumbs } = useBreadcrumbStore((state) => state);

  const slug = useMemo(() => {
    return params.slug;
  }, [params]);

  const { data, loading, refresh } = useRequest(
    () => {
      if (!slug) return Promise.resolve(undefined);
      return getBranchDetailService(slug);
    },
    {
      onSuccess: (data) => {
        if (!data) return;
        setBreadcrumbs([{ label: data.name, to: `${ROUTE_PATH.HOTEL}/${data.slug}` }]);
      },
      refreshDeps: [slug],
    },
  );
  console.log(data);
  const { data: getAmenitiesResponse, loading: fetchingAmenities } = useRequest(() =>
    getAmenitiesService({
      pageSize: 100,
      filters: JSON.stringify({
        types: ['PROPERTY'],
      }),
    }),
  );

  const updateAmenitiesDialog = DialogCustom.useDialog();
  const updateNearByDialog = DialogCustom.useDialog();

  const formatAmenities = (amenities: Amenity[]): Option[] => {
    return amenities.map((amenity) => ({
      label: amenity.name,
      value: amenity.id,
    }));
  };

  const amenityOtions: Option[] = useMemo(() => {
    if (!getAmenitiesResponse) return [];

    return formatAmenities(getAmenitiesResponse.data);
  }, [getAmenitiesResponse]);

  if (loading || fetchingAmenities) return <LoadingSection />;

  if (!data) return <div>Không tìm thấy chi nhánh</div>;

  const editButton = (length: number, onClick: () => void) => {
    return (
      <Button className='rounded-full !h-[36px] !w-[36px] p-0' onClick={onClick}>
        {length > 0 ? <PencilLine className='!w-5 !h-5' /> : <Plus className='!w-5 !h-5' />}
      </Button>
    );
  };

  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 sm:grid-cols-[560px_1fr] gap-6'>
        <ImageGalleryCarousel slides={[data.thumbnail, ...data.images]} />

        <div className='flex-1 flex flex-col gap-6'>
          <Text type='heading3-semi-bold'>{data?.name}</Text>

          <div>
            <div className='flex items-center gap-3'>
              <Text type='heading6-bold'>Tiện ích</Text>
              <Armchair className='!w-5 !h-5' />
            </div>
            <div className='mt-3 flex flex-wrap gap-3'>
              {editButton(data?.amenities.length, updateAmenitiesDialog.open)}

              {data?.amenities.map((amenity) => (
                <AmenityBadge key={amenity.id} amenity={amenity} />
              ))}
            </div>
          </div>

          <div>
            <div className='flex items-center gap-3'>
              <Text type='heading6-bold'>Các địa điểm gần</Text>
              <MapPin className='!w-5 !h-5' />
            </div>
            <div className='flex items-start gap-3 mt-3'>
              <div className='h-16 flex items-center'>
                {editButton(data?.nearBy.length, updateNearByDialog.open)}
              </div>

              <div className='flex-1 flex flex-wrap gap-3'>
                {data?.nearBy.map((nearBy, index) => (
                  <div
                    key={index}
                    className='h-16 flex items-center gap-2 px-3 rounded-lg border border-border hover:bg-accent transition-colors'
                  >
                    <div className='flex-1'>
                      <Text className='text-muted-foreground'>{nearBy.name}</Text>
                      <Text>{nearBy.distance}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className='w-full mt-6 bg-sidebar'>
        <CardHeader>
          <CardTitle>Mô tả</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className='text-justify'>{data.description}</Text>
        </CardContent>
      </Card>

      <RoomDetailSection roomDetails={data.rooms} />

      {/* Dialogs */}
      <DialogCustom dialog={updateAmenitiesDialog} header='Cập nhật tiện ích'>
        <UpdateAmenitiesForm
          branchId={data.id}
          currentAmenities={formatAmenities(data.amenities)}
          allAmenities={amenityOtions}
          onCloseDialog={updateAmenitiesDialog.close}
          onSuccessfulUpdate={() => {
            updateAmenitiesDialog.close();
            refresh();
          }}
        />
      </DialogCustom>

      <DialogCustom dialog={updateNearByDialog} header='Cập nhật địa điểm gần'>
        <UpdateNearByForm
          branchId={data.id}
          currentNearBys={data.nearBy}
          onCloseDialog={updateNearByDialog.close}
          onSuccessfulUpdate={() => {
            updateNearByDialog.close();
            refresh();
          }}
        />
      </DialogCustom>
    </div>
  );
};

export default RoomDetailPage;
