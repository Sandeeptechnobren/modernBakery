"use client";

import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import React, { useEffect, useState } from "react";

type Props = {
  values: Record<string, string>;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFieldValue: (field: string, value: string) => void;
  setTouched?: (fields: Record<string, boolean>) => void; // Accept setTouched from Formik
};

export default function WarehouseLocationInfo({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  setTouched,
}: Props) {
  const { regionOptions, areaOptions, loading, fetchAreaOptions } = useAllDropdownListData();

  // Touched tracking for dropdowns
  useEffect(() => {
    if (setTouched) {
      // Only mark region/area touched when the fields are visible (i.e. agent_customer type)
      if (values.warehouse_type === 'agent_customer') {
        if (!values.region_id) setTouched({ region_id: true });
        if (!values.area_id) setTouched({ area_id: true });
      }
    }
  }, [values.region_id, values.area_id, setTouched]);

  // Fetch area options on region change
  useEffect(() => {
    if (values.region_id) fetchAreaOptions(values.region_id);
  }, [values.region_id, fetchAreaOptions]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <InputFields
            required
            label="Location"
            name="location"
            value={values.location}
            onChange={handleChange}
            options={[
              { value: "Urban", label: "Urban" },
              { value: "Suburban", label: "Suburban" },
              { value: "Rural", label: "Rural" },
            ]}
            error={errors?.location && touched?.location ? errors.location : undefined}
          />
          {errors?.location && touched?.location && (
            <span className="text-xs text-red-500 mt-1">{errors.location}</span>
          )}
        </div>
        <div>
          <InputFields
            required
            label="City"
            name="city"
            value={values.city}
            onChange={handleChange}
            error={errors?.city && touched?.city ? errors.city : undefined}
          />
          {errors?.city && touched?.city && (
            <span className="text-xs text-red-500 mt-1">{errors.city}</span>
          )}
        </div>
        {values.warehouse_type === 'agent_customer' && (
          <>
            <div>
              <InputFields
                required
                label="Region"
                name="region_id"
                disabled={true}
                showSkeleton={loading}
                value={values.region_id}
                onChange={handleChange}
                onBlur={() => setTouched && setTouched({ region_id: true })}
                options={regionOptions}
                error={errors?.region_id && touched?.region_id ? errors.region_id : undefined}
              />
              {errors?.region_id && touched?.region_id && (
                <span className="text-xs text-red-500 mt-1">{errors.region_id}</span>
              )}
            </div>
            <div>
              <InputFields
                required
                label="Area"
                name="area_id"
                disabled={true}
                showSkeleton={loading}
                value={values.area_id}
                onChange={handleChange}
                onBlur={() => setTouched && setTouched({ area_id: true })}
                options={areaOptions}
                error={errors?.area_id && touched?.area_id ? errors.area_id : undefined}
              />
              {errors?.area_id && touched?.area_id && (
                <span className="text-xs text-red-500 mt-1">{errors.area_id}</span>
              )}
            </div>
          </>
        )}
        {/* ...rest fields unchanged */}
        <div>
          <InputFields
            label="Town/Village"
            name="town_village"
            value={values.town_village}
            onChange={handleChange}
            error={errors?.town_village && touched?.town_village ? errors.town_village : undefined}
          />
          {errors?.town_village && touched?.town_village && (
            <span className="text-xs text-red-500 mt-1">{errors.town_village}</span>
          )}
        </div>
        <div>
          <InputFields
            label="Street"
            name="street"
            value={values.street}
            onChange={handleChange}
            error={errors?.street && touched?.street ? errors.street : undefined}
          />
          {errors?.street && touched?.street && (
            <span className="text-xs text-red-500 mt-1">{errors.street}</span>
          )}
        </div>
        <div>
          <InputFields
            label="Landmark"
            name="landmark"
            value={values.landmark}
            onChange={handleChange}
            error={errors?.landmark && touched?.landmark ? errors.landmark : undefined}
          />
          {errors?.landmark && touched?.landmark && (
            <span className="text-xs text-red-500 mt-1">{errors.landmark}</span>
          )}
        </div>
        <div>
          <InputFields
            required
            label="Latitude"
            type="number"
            name="latitude"
            value={values.latitude}
            onChange={handleChange}
            error={errors?.latitude && touched?.latitude ? errors.latitude : undefined}
          />
          {errors?.latitude && touched?.latitude && (
            <span className="text-xs text-red-500 mt-1">{errors.latitude}</span>
          )}
        </div>
        <div>
          <InputFields
            required
            label="Longitude"
            name="longitude"
            type="number"
            value={values.longitude}
            onChange={handleChange}
            error={errors?.longitude && touched?.longitude ? errors.longitude : undefined}
          />
          {errors?.longitude && touched?.longitude && (
            <span className="text-xs text-red-500 mt-1">{errors.longitude}</span>
          )}
        </div>
      </div>
    </>
  );
}
