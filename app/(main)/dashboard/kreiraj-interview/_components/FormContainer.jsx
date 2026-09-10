"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InterviewType } from "@/services/Constants";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

function FormContainer({ onHandleInputChange, GoToNext, formData = {} }) {
  const [interviewType, setInterviewType] = useState([]);

  useEffect(() => {
    if (interviewType) {
      onHandleInputChange("type", interviewType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewType]);

  const AddInterviewType = (type) => {
    const exists = interviewType.includes(type);
    if (!exists) {
      setInterviewType((prev) => [...prev, type]);
    } else {
      setInterviewType(interviewType.filter((item) => item !== type));
    }
  };

  return (
    <div className="p-5 bg-white rounded-xl">
      {/* Pozicija */}
      <div>
        <h2 className="text-sm font-medium">Pozicija</h2>
        <Input
          placeholder="primjer: Full Stack Developer"
          className="mt-2"
          onChange={(e) => onHandleInputChange("jobPosition", e.target.value)}
          defaultValue={formData.jobPosition || ""}
        />
      </div>

      {/* Opis posla */}
      <div className="mt-5">
        <h2 className="text-sm font-medium">Opis posla</h2>
        <Textarea
          placeholder="Unesi opis posla"
          className="h-[200px] mt-2"
          onChange={(e) => onHandleInputChange("jobDescription", e.target.value)}
          defaultValue={formData.jobDescription || ""}
        />
      </div>

      {/* Jezik intervjua (NOVO) */}
      <div className="mt-5">
        <h2 className="text-sm font-medium">Jezik intervjua</h2>
        <Select
          value={formData.lang ?? "bs"}
          onValueChange={(value) => onHandleInputChange("lang", value)}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Odaberi jezik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bs">Bosanski</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trajanje */}
      <div className="mt-5">
        <h2 className="text-sm font-medium">Trajanje intervjua</h2>
        <Select
          value={formData.duration}
          onValueChange={(value) => onHandleInputChange("duration", value)}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Odaberi trajanje intervjua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5 Min">5 Min</SelectItem>
            <SelectItem value="15 Min">15 Min</SelectItem>
            <SelectItem value="30 Min">30 Min</SelectItem>
            <SelectItem value="45 Min">45 Min</SelectItem>
            <SelectItem value="60 Min">60 Min</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tip intervjua */}
      <div className="mt-5">
        <h2 className="text-sm font-medium">Tip intervjua</h2>
        <div className="flex gap-3 flex-wrap mt-2">
          {InterviewType.map((type, index) => (
            <div
              key={index}
              className={`flex items-center cursor-pointer gap-2 p-1 px-4 bg-white border border-gray-300 rounded-2xl hover:bg-secondary ${
                interviewType.includes(type.title) && "bg-blue-100 text-primary"
              }`}
              onClick={() => AddInterviewType(type.title)}
            >
              <type.icon className="h-4 w-4" />
              <span>{type.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next */}
      <div className="mt-7 flex justify-end" onClick={GoToNext}>
        <Button>
          Generiši pitanja <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default FormContainer;
