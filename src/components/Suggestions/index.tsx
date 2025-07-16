import { _get } from "@/utils";
import { useRef, useEffect } from "react";
import clsx from "clsx";
import { getBuiltAddress, handleHighlightSuggest } from "@/utils";
import "./index.css";
import { SuggestionComponentType } from "@/types";

const SuggestionsComponent = <T extends { name: string }>({
  suggestions,
  onHandleSelection,
  show,
  value,
  onClose,
}: SuggestionComponentType<T>) => {
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [suggestionRef]);
  return (
    <div
      ref={suggestionRef}
      className={clsx("main-search-suggestions-container", {
        "suggestions-container-show": show,
        "suggestions-container-hide": !show,
      })}
    >
      <div className="main-suggestion-container">
        <ul>
          {suggestions.map((suggestion, indx) => {
            if (suggestion.name === "-1") {
              return (
                <li key={indx} className="no-found">
                  Nothing Found
                </li>
              );
            }
            const rest_name = _get<string>(suggestion, "name");
            const slugName = _get<string>(suggestion, "slug");
            const address = getBuiltAddress({
              address: _get<string>(suggestion, "address"),
              city: _get<string>(suggestion, "city"),
              state: _get<string>(suggestion, "state"),
              country: _get<string>(suggestion, "country"),
              postal_code: _get<string>(suggestion, "postal_code"),
            });

            const complete_name = address
              ? `${rest_name} ${address}`
              : rest_name;

            const new_suggest = handleHighlightSuggest(complete_name, value);
            return (
              <li
                onClick={() => onHandleSelection(complete_name, slugName)}
                key={indx}
                dangerouslySetInnerHTML={{ __html: new_suggest }}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SuggestionsComponent;
