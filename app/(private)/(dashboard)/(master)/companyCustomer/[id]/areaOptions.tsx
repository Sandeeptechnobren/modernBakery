import { useEffect, useRef } from "react";
import { useFormikContext, FormikContextType } from "formik";

import type { CompanyCustomerFormValues } from "./page";

interface Props {
  fetchAreaOptions: (regionId: string) => Promise<any>;
  setSkeleton: (s: any) => void;
  preserveExistingArea?: boolean;
  initialArea?: string;
}

export default function RegionWatcher({ fetchAreaOptions, setSkeleton, preserveExistingArea, initialArea }: Props) {
  const { values, setFieldValue }: FormikContextType<CompanyCustomerFormValues> = useFormikContext<CompanyCustomerFormValues>();
  const prevRegionRef = useRef<string | undefined>(undefined);
  const initialAppliedRef = useRef(false);

  // console.log("RegionWatcher render - current region:", values.region, "initialArea:", initialArea);

  useEffect(() => {
    const prev = prevRegionRef.current;
    // only react when region actually changes
    if (prev !== values.region_id) {
      console.log("RegionWatcher render - current region:", values.region_id, "initialArea:", initialArea);
      // clear area when user actively changes region (but not on first mount)
      if (prev !== undefined) {
        setFieldValue("area", "");
      }

      if (values.region_id) {
        setSkeleton((prev:Record<string, boolean>) => ({ ...prev, area: true }));
        fetchAreaOptions(values.region_id)
          .then((areas) => {
            // Only preserve existing area when an actual initial area value exists.
            // If initialArea is present and Formik doesn't yet have it, set it,
            // then skip auto-selecting the first fetched area.
            if (preserveExistingArea && initialArea) {
              if (!values.area_id) {
                setFieldValue("area", initialArea);
                initialAppliedRef.current = true;
              }
              return;
            }

            // Only auto-select when form currently has no area value
            if (!values.area_id && areas && areas.length > 0) {
              setFieldValue("area", String(areas[0].value ?? areas[0].id ?? ""));
            }
          })
          .finally(() => setSkeleton((prev:Record<string, boolean>) => ({ ...prev, area: false })));
      }
    }

    prevRegionRef.current = values.region_id;
    // include preserveExistingArea & setSkeleton so effect reacts to them too
  }, [values.region_id, fetchAreaOptions, setFieldValue, setSkeleton, preserveExistingArea, initialArea]);

  // If initialArea arrives after the first fetch, ensure we apply it once.
  useEffect(() => {
    if (!preserveExistingArea) return;
    if (!initialArea) return;
    if (!values.region_id) return;
    if (values.area_id) return; // already set
    if (initialAppliedRef.current) return; // already applied

    // ensure options are loaded (fetch once) then apply the initialArea
    initialAppliedRef.current = true;
    setSkeleton((prev:Record<string, boolean>) => ({ ...prev, area: true }));
    fetchAreaOptions(values.region_id)
      .then(() => {
        setFieldValue("area", initialArea);
      })
      .catch(() => {
        // ignore fetch errors here; we still attempt to set the value
        setFieldValue("area", initialArea);
      })
      .finally(() => setSkeleton((prev:Record<string, boolean>) => ({ ...prev, area: false })));
  }, [initialArea, values.region_id, preserveExistingArea, values.area_id, fetchAreaOptions, setFieldValue, setSkeleton]);
 
  return null;
}
