"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { getSurveyById, getSurveyQuestions } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type SurveyFormValues = {
  survey_code: string;
  survey_name: string;
  start_date: string;
  end_date: string;
  status: number | "Active" | "Inactive";
};

type Question = {
  id: number;
  survey_question_code: string;
  survey_id: number;
  question: string;
  question_type: string;
  question_based_selected?: string | null; // e.g. "yes,no"
  created_at: string;
  updated_at: string;
};

const title = "Survey Details";
const backBtnUrl = "/dashboard/merchandiser/survey";

export default function ViewPage() {
  const params = useParams();
  const id = params?.id;

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [survey, setSurvey] = useState<SurveyFormValues | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchSurveyDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Fetch survey details
        const res = await getSurveyById(id.toString());

        if (res.error) {
          showSnackbar(res.data?.message || "Unable to fetch Survey Details", "error");
          setLoading(false);
          return;
        }

        const surveyData = {
          survey_code: res.data.survey_code || "-",
          survey_name: res.data.survey_name || "-",
          start_date: res.data.start_date || "-",
          end_date: res.data.end_date || "-",
          status: res.data.status,
        };
        setSurvey(surveyData);

        // Fetch related questions
        const qRes = await getSurveyQuestions(id.toString());
        if (!qRes.error) {
          setQuestions(qRes.data || []);
        } else {
          showSnackbar("Unable to fetch survey questions", "error");
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
        showSnackbar("Something went wrong while fetching Survey details", "error");
      }
    };

    fetchSurveyDetails();
  }, [id, setLoading, showSnackbar]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {/* Survey Details */}
      <div className="flex flex-wrap gap-x-[20px] mb-8">
        <ContainerCard className="w-full">
          <KeyValueData
            data={[
              { value: survey?.survey_code, key: "Survey Code" },
              { value: survey?.survey_name, key: "Survey Name" },
              { value: survey?.start_date, key: "Start Date" },
              { value: survey?.end_date, key: "End Date" },
              {
                value: "",
                key: "Status",
                component: (
                  <StatusBtn
                    isActive={survey?.status === 1 || survey?.status === "Active"}
                  />
                ),
              },
            ]}
          />
        </ContainerCard>
      </div>

      {/* Questions List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Survey Questions</h2>
        {questions.length === 0 ? (
          <p className="text-gray-500">No questions found for this survey.</p>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <ContainerCard key={q.id} className="p-4">
                <p className="font-medium">{q.question}</p>
                
                {q.question_based_selected && (
                  <p className="text-sm text-gray-500">
                    Options: {q.question_based_selected}
                  </p>
                )}
              </ContainerCard>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
