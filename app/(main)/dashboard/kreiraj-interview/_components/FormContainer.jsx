"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InterviewType } from "@/services/Constants";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const DURATIONS = ["5 Min", "15 Min", "30 Min", "45 Min", "60 Min"];

function FormContainer({ onHandleInputChange, GoToNext, formData = {} }) {
  const selectedTypes = Array.isArray(formData.type) ? formData.type : [];

  const toggleInterviewType = (type) => {
    onHandleInputChange(
      "type",
      selectedTypes.includes(type)
        ? selectedTypes.filter((item) => item !== type)
        : [...selectedTypes, type]
    );
  };

  return (
    <div className="p-5 md:p-7 bg-white border rounded-xl">
      {/* Pozicija */}
      <div>
        <label htmlFor="jobPosition" className="text-sm font-medium">Pozicija</label>
        <Input
          id="jobPosition"
          placeholder="npr. Full Stack Developer"
          className="mt-2"
          onChange={(e) => onHandleInputChange("jobPosition", e.target.value)}
          defaultValue={formData.jobPosition || ""}
        />
      </div>

      {/* Opis posla */}
      <div className="mt-5">
        <label htmlFor="jobDescription" className="text-sm font-medium">Opis posla</label>
        <Textarea
          id="jobDescription"
          placeholder="Opišite odgovornosti, potrebne vještine i iskustvo…"
          className="h-[200px] mt-2"
          onChange={(e) => onHandleInputChange("jobDescription", e.target.value)}
          defaultValue={formData.jobDescription || ""}
        />
      </div>

      {/* Trajanje */}
      <div className="mt-5">
        <h2 className="text-sm font-medium">Trajanje intervjua</h2>
        <Select
          value={formData.duration}
          onValueChange={(value) => onHandleInputChange("duration", value)}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Odaberite trajanje intervjua" />
          </SelectTrigger>
          <SelectContent>
            {DURATIONS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tip intervjua */}
      <div className="mt-5">
        <h2 className="text-sm font-medium">Tip intervjua</h2>
        <p className="text-xs text-gray-500">Možete odabrati više tipova.</p>
        <div className="flex gap-3 flex-wrap mt-2">
          {InterviewType.map((type) => {
            const selected = selectedTypes.includes(type.title);
            return (
              <button
                type="button"
                key={type.title}
                aria-pressed={selected}
                className={`flex items-center cursor-pointer gap-2 py-1.5 px-4 border rounded-2xl transition ${
                  selected
                    ? "bg-primary/10 border-primary text-primary font-medium"
                    : "bg-white border-gray-300 hover:bg-secondary"
                }`}
                onClick={() => toggleInterviewType(type.title)}
              >
                {selected ? <Check className="h-4 w-4" /> : <type.icon className="h-4 w-4" />}
                <span>{type.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dalje */}
      <div className="mt-7 flex justify-end">
        <Button onClick={GoToNext}>
          Generiši pitanja <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default FormContainer;
