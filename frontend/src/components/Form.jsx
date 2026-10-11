import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

const Form = ({
  title,
  fields,
  formData,
  handleChange,
  handleSubmit,
  loading,
  submitButtonText,
  resetPasswordText,
  resetPasswordLink,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full space-y-6 font-sans text-[#1E1F21] dark:text-zinc-100">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1F21] dark:text-white tracking-tight">
          {title}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          {fields.map(field => {
            const isPassword = field.type === "password";
            const inputType = isPassword ? (showPassword ? "text" : "password") : field.type;

            return (
              <div key={field.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    {field.label}
                  </label>

                  {isPassword && resetPasswordText && (
                    <NavLink
                      to={resetPasswordLink || "#"}
                      className="text-xs font-bold text-[#167CC2] hover:underline transition-all"
                    >
                      {resetPasswordText}
                    </NavLink>
                  )}
                </div>

                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-[#1E1F21] dark:text-zinc-100 placeholder-zinc-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all resize-none shadow-xs"
                  />
                ) : (
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-zinc-400 pointer-events-none">
                      {field.type === "email" ? (
                        <Mail size={16} />
                      ) : isPassword ? (
                        <Lock size={16} />
                      ) : null}
                    </span>

                    <input
                      type={inputType}
                      name={field.name}
                      pattern={field.pattern}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className={`w-full py-3 rounded-full bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-[#1E1F21] dark:text-zinc-100 placeholder-zinc-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all shadow-xs ${
                        field.type === "email" || isPassword ? "pl-11" : "px-4"
                      } ${isPassword ? "pr-11" : "pr-4"}`}
                    />

                    {isPassword && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-full bg-[#1E1F21] dark:bg-white text-white dark:text-[#1E1F21] hover:opacity-90 disabled:opacity-40 text-xs font-extrabold transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-[#167CC2]" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span>{submitButtonText}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
