"use client";

import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

type Props = {
  values: Record<string, string>;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFieldValue: (field: string, value: string) => void;
};

export default function WarehouseLocationInfo({ values, errors, touched, handleChange, setFieldValue }: Props) {
  const { regionOptions, loading, areaOptions } = useAllDropdownListData();

  return (
    <>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Row 1 */}
        <InputFields
        required
          label="Region"
          name="region_id"
          value={values.region_id}
          onChange={handleChange}
          options={loading ? [{ value: '', label: 'Loading...' }] : (regionOptions && regionOptions.length > 0 ? regionOptions : [{ value: '', label: 'No options available' }])}
          error={errors?.region_id && touched?.region_id ? errors.region_id : false}
        />
        <InputFields
        required
          label="Sub Region"
          name="area_id"
          value={values.area_id}
          onChange={handleChange}
          options={loading ? [{ value: '', label: 'Loading...' }] : (areaOptions && areaOptions.length > 0 ? areaOptions : [{ value: '', label: 'No options available' }])}
          error={errors?.area_id && touched?.area_id ? errors.area_id : false}
        />
  <InputFields 
  required
    label="City" 
    name="city" 
    value={values.city} 
    onChange={handleChange} 
    error={errors?.city && touched?.city ? errors.city : false}
  />
  <InputFields 
    label="District" 
    name="district" 
    value={values.district} 
    onChange={handleChange} 
    error={errors?.district && touched?.district ? errors.district : false}
  />
  <InputFields 
  required
    label="Location" 
    name="location" 
    value={values.location} 
    onChange={handleChange} 
    error={errors?.location && touched?.location ? errors.location : false}
  />
  <InputFields 
  required
    label="Address" 
    name="address" 
    value={values.address} 
    onChange={handleChange} 
    error={errors?.address && touched?.address ? errors.address : false}
  />

    {/* Row 2 */}
  <InputFields 
    label="Town/Village" 
    name="town_village" 
    value={values.town_village} 
    onChange={handleChange} 
    error={errors?.town_village && touched?.town_village ? errors.town_village : false}
  />
  <InputFields 
    label="Street" 
    name="street" 
    value={values.street} 
    onChange={handleChange} 
    error={errors?.street && touched?.street ? errors.street : false}
  />
  <InputFields 
    label="Landmark" 
    name="landmark" 
    value={values.landmark} 
    onChange={handleChange} 
    error={errors?.landmark && touched?.landmark ? errors.landmark : false}
  />

        {/* Row 3 */}
  <InputFields 
  required
    label="Latitude" 
    name="latitude" 
    value={values.latitude} 
    onChange={handleChange} 
    error={errors?.latitude && touched?.latitude ? errors.latitude : false} 
  />
  <InputFields 
  required
    label="Longitude" 
    name="longitude" 
    value={values.longitude} 
    onChange={handleChange} 
    error={errors?.longitude && touched?.longitude ? errors.longitude : false} 
  />
  <InputFields 
  required
    label="Threshold Radius" 
    name="threshold_radius" 
    value={values.threshold_radius} 
    onChange={handleChange} 
    error={errors?.threshold_radius && touched?.threshold_radius ? errors.threshold_radius : false} 
  />
      </div>

    </>
  );
}