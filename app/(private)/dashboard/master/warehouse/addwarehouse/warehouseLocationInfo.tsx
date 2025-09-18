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
          label="Region"
          name="region"
          value={values.region}
          onChange={handleChange}
          options={loading ? [{ value: '', label: 'Loading...' }] : (regionOptions && regionOptions.length > 0 ? regionOptions : [{ value: '', label: 'No options available' }])}
          error={errors?.region && touched?.region ? errors.region : false}
        />
        <InputFields
          label="Sub Region"
          name="subRegion"
          value={values.subRegion}
          onChange={handleChange}
          options={loading ? [{ value: '', label: 'Loading...' }] : (areaOptions && areaOptions.length > 0 ? areaOptions : [{ value: '', label: 'No options available' }])}
          error={errors?.subRegion && touched?.subRegion ? errors.subRegion : false}
        />
        <InputFields label="District" name="district" value={values.district} onChange={handleChange} />

        {/* Row 2 */}
        <InputFields label="Town/Village" name="town" value={values.town} onChange={handleChange} />
        <InputFields label="Street" name="street" value={values.street} onChange={handleChange} />
        <InputFields label="Landmark" name="landmark" value={values.landmark} onChange={handleChange} />

        {/* Row 3 */}
        <InputFields label="Latitude" name="latitude" value={values.latitude} onChange={handleChange} error={errors?.latitude && touched?.latitude ? errors.latitude : false} />
        <InputFields label="Longitude" name="longitude" value={values.longitude} onChange={handleChange} error={errors?.longitude && touched?.longitude ? errors.longitude : false} />
        <InputFields label="Threshold Radius" name="thresholdRadius" value={values.thresholdRadius} onChange={handleChange} error={errors?.thresholdRadius && touched?.thresholdRadius ? errors.thresholdRadius : false} />
      </div>

    </>
  );
}