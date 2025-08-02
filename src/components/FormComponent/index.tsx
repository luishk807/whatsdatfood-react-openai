import { lazy, useState, useMemo, type FC, Suspense, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import {
  FormFieldType,
  formCompObjType,
  formCompValueType,
} from "@/interfaces";
import { FIELD_TYPES } from "@/customConstants";
import { FormComponentInterface } from "@/interfaces";
import "./index.css";
import { getMissingField, getLabelFromKey } from "@/utils";
import FormTextfieldSkeleton from "@/components/SkeletonLoaders/FormTextfield";
import FormRatingSkeleton from "@/components/SkeletonLoaders/Rating";
import FormButtonSkeleton from "../SkeletonLoaders/Rectangle";
const LazyRating = lazy(() => import("@/components/Rating"));
const LazyTextField = lazy(() => import("@/components/TextField"));
const LazyTextFieldDebounce = lazy(
  () => import("@/components/TextFieldDebounce"),
);
const LazyButton = lazy(() => import("@/components/Button"));

const FormComponent: FC<FormComponentInterface> = ({
  fields,
  title,
  submitLabel,
  onHandleSubmit,
  onPrevious,
  showLoadingSubmit,
  defaultValue,
}) => {
  const [formData, setFormData] = useState<formCompObjType>({});
  const [isSubmitLoading, setIsSubmitLoading] = useState(
    showLoadingSubmit || false,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const handleOnChange = (key: string, item: formCompValueType) => {
    setErrors([]);
    setErrorFields([]);
    const { label, value, type } = item;
    if (key && value) {
      setFormData({
        ...formData,
        [key]: {
          value,
          label,
          type: type,
        },
      });
    } else {
      setFormData((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  useEffect(() => {
    if (showLoadingSubmit) {
      setIsSubmitLoading(showLoadingSubmit);
    }
  }, [showLoadingSubmit]);

  const getFieldError = (item: formCompValueType) => {
    switch (item.type) {
      case FIELD_TYPES.textfield:
      case FIELD_TYPES.date:
      case FIELD_TYPES.username:
        return item.value ? "" : `${item.label} can't be empty`;
      case FIELD_TYPES.email:
        return item.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.value)
          ? ""
          : `${item.label} must be valid`;
      case FIELD_TYPES.password: {
        const passwordFields = fields.filter(
          (item) => item.isRequired && item.type === FIELD_TYPES.password,
        );

        const passwordFieldKeys = passwordFields.map((item) => item.name);
        const formPasswordFields = Object.keys(formData).filter(
          (key) => formData[key].type === FIELD_TYPES.password,
        );

        const missingPassword = getMissingField(
          passwordFieldKeys,
          formPasswordFields,
        );

        const labelMissing = getLabelFromKey(fields, missingPassword);

        if (labelMissing.length) {
          return labelMissing.length
            ? `${labelMissing.join(",")} is missing`
            : "";
        } else {
          const passwordValues = passwordFieldKeys.map(
            (key) => formData[key]?.value,
          );
          const allMatch = passwordValues.every(
            (val) => val === passwordValues[0],
          );

          const labelMissing = getLabelFromKey(fields, passwordFieldKeys);

          if (!allMatch) {
            return `${labelMissing.join(", ")} doesn't match`;
          }
          return "";
        }
      }
    }
  };

  const handleSubmit = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent
      | React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setErrors([]);
    let payloadMap = new Map();
    let errorList: string[] = [];

    if (!Object.keys(formData).length) {
      setErrors((prev) => [...prev, "form can't be empty"]);
      return;
    }

    Object.keys(formData).forEach((key: string) => {
      const error = getFieldError(formData[key]);
      if (error) {
        errorList.push(error);
      }
      payloadMap.set(key, formData[key].value);
    });

    if (!errorList.length) {
      const fieldMissing = getMissingField(
        requiredFields,
        Array.from(payloadMap.keys()),
      );

      if (fieldMissing.length) {
        setErrors(fieldMissing.map((item) => `${item} can't be empty`));
        setErrorFields(fieldMissing);
        return;
      }

      onHandleSubmit && onHandleSubmit(Object.fromEntries(payloadMap));
      setFormData({});
    } else {
      setErrors(Array.from(new Set(errorList)));
    }
  };

  const getFieldType = (field: FormFieldType, key: number) => {
    switch (field.type) {
      case FIELD_TYPES.textfield:
      case FIELD_TYPES.date:
      case FIELD_TYPES.email:
      case FIELD_TYPES.password:
        return (
          <Grid
            size={12}
            className="field-container"
            key={`${key}-${field.name}`}
          >
            <Suspense fallback={<FormTextfieldSkeleton />}>
              <LazyTextField
                name={field.name}
                type={field.type}
                label={field.label}
                isError={errorFields.includes(field.name)}
                isPlaceholder={field.placeholder}
                onChange={(value: string) =>
                  handleOnChange(field.name, {
                    label: field.label,
                    type: field.type,
                    value,
                  })
                }
              />
            </Suspense>
          </Grid>
        );
      case FIELD_TYPES.username:
        return (
          <Grid
            size={12}
            className="field-container"
            key={`${key}-${field.name}`}
          >
            <Suspense fallback={<FormTextfieldSkeleton />}>
              <LazyTextFieldDebounce
                name={field.name}
                type={field.type}
                label={field.label}
                isError={errorFields.includes(field.name)}
                isPlaceholder={field.placeholder}
                onChange={(value: string) =>
                  handleOnChange(field.name, {
                    label: field.label,
                    type: field.type,
                    value,
                  })
                }
              />
            </Suspense>
          </Grid>
        );
      case FIELD_TYPES.rating:
        return (
          <Grid
            size={12}
            className="field-container flex flex-col"
            key={`${key}-${field.name}`}
          >
            <Suspense fallback={<FormRatingSkeleton />}>
              <LazyRating
                defaultValue={0}
                label={field.label}
                onClick={(value: number) =>
                  handleOnChange(field.name, {
                    label: field.label,
                    type: field.type,
                    value: String(value),
                  })
                }
              />
            </Suspense>
          </Grid>
        );
    }
  };

  if (!fields.length) {
    throw new Error("No Fields Available");
  }

  const requiredFields = useMemo(
    () => fields.filter((item) => item.isRequired).map((item) => item.name),
    [fields],
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
    >
      <Box>
        <Grid
          container
          id="form-component-container"
          sx={{
            padding: {
              lg: "0px",
              xs: "10px",
            },
          }}
        >
          {title && (
            <Grid className="field-title" size={12}>
              {title}
            </Grid>
          )}
          {!!errors.length && (
            <Grid>
              <ul>
                {errors.map((item, indx) => (
                  <li key={indx}>{item}</li>
                ))}
              </ul>
            </Grid>
          )}
          {fields.map((item, indx) => getFieldType(item, indx))}
          <Grid size={12} className="form-component-button-container">
            {onPrevious && (
              <Grid size={5} spacing={1} className="field-container">
                <Suspense fallback={<FormButtonSkeleton />}>
                  <LazyButton type="button" onClick={onPrevious}>
                    Back
                  </LazyButton>
                </Suspense>
              </Grid>
            )}
            {submitLabel && (
              <Grid size={onPrevious ? 5 : 12} className="field-container">
                <Suspense fallback={<FormButtonSkeleton />}>
                  <LazyButton disabled={isSubmitLoading} type="submit">
                    {submitLabel}
                  </LazyButton>
                </Suspense>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default FormComponent;
