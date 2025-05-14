import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState } from "react";

type PlacesProps = {
  setOffice: (position: google.maps.LatLngLiteral) => void;
};

export default function Places({ setOffice }: PlacesProps) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (val: string) => {
    if (!val || !val.trim()) return;

    setValue(val, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: val });
      const { lat, lng } = await getLatLng(results[0]);
      setOffice({ lat, lng });
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  return (
    <Combobox value={value} onChange={handleSelect}>
      <div className="relative">
        <ComboboxInput
          disabled={!ready}
          className="w-full border border-gray-300 rounded-md p-2 text-black"
          placeholder="Enter Landfill Location"
          onChange={(event) => setValue(event.target.value)}
        />
        {status === "OK" && value?.trim() !== "" && (
          <ComboboxOptions className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
            {data.map(({ place_id, description }) => (
              <ComboboxOption
                key={place_id}
                value={description}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${
                    active ? "bg-blue-500 text-white" : "text-black"
                  }`
                }
              >
                {description}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}
