import { useState } from "react";
import {
  startTruecallerVerification,
  buildTruecallerDeepLink,
  getTruecallerVerificationStatus,
  isAndroidDevice,
  invokeTruecaller,
} from "../../../services/truecaller/truecallerService";


export default function TruecallerButton({
  onSuccess,
  onError,
}) {
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");


  const handleTruecallerLogin =
    async () => {

      if (loading) {
        return;
      }

      setMessage("");


      // --------------------------------
      // Android requirement
      // --------------------------------

      if (!isAndroidDevice()) {
        const error =
          "Truecaller verification is currently available on Android devices.";

        setMessage(error);

        if (onError) {
          onError(error);
        }

        return;
      }


      setLoading(true);


      try {

        // ------------------------------
        // 1. Create verification request
        // ------------------------------

        const data =
          await startTruecallerVerification();


        const {
          request_nonce,
          partner_key,
          partner_name,
        } = data;


        // ------------------------------
        // 2. Build Truecaller deep link
        // ------------------------------

        const deepLink =
          buildTruecallerDeepLink({
            requestNonce:
              request_nonce,

            partnerKey:
              partner_key,

            partnerName:
              partner_name,
          });


        // ------------------------------
        // 3. Invoke Truecaller
        // ------------------------------

        setMessage(
          "Opening Truecaller..."
        );


        const hadFocus =
          document.hasFocus();


        invokeTruecaller(
          deepLink
        );


        // ------------------------------
        // 4. Detect whether Truecaller
        //    opened
        // ------------------------------

        setTimeout(() => {

          if (
            hadFocus &&
            document.hasFocus()
          ) {
            setLoading(false);

            const error =
              "Truecaller could not be opened. Please make sure the Truecaller app is installed.";

            setMessage(error);

            if (onError) {
              onError(error);
            }

            return;
          }

        }, 800);


        // ------------------------------
        // 5. Poll backend
        // ------------------------------

        let completed =
          false;


        for (
          let attempt = 0;
          attempt < 5;
          attempt++
        ) {

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                3000
              )
          );


          const status =
            await getTruecallerVerificationStatus(
              request_nonce
            );


          if (
            status.status ===
            "completed"
          ) {

            completed = true;

            setLoading(false);

            setMessage(
              "Truecaller verification successful."
            );


            if (onSuccess) {
              onSuccess(
                status.profile
              );
            }

            break;
          }


          if (
            status.status ===
            "user_rejected"
          ) {

            completed = true;

            setLoading(false);

            const error =
              "Truecaller verification was cancelled.";

            setMessage(error);

            if (onError) {
              onError(error);
            }

            break;
          }


          if (
            status.status ===
            "failed"
          ) {

            completed = true;

            setLoading(false);

            const error =
              "Truecaller verification failed.";

            setMessage(error);

            if (onError) {
              onError(error);
            }

            break;
          }
        }


        // ------------------------------
        // 6. Timeout
        // ------------------------------

        if (!completed) {

          setLoading(false);

          const error =
            "Truecaller verification timed out. Please try again.";

          setMessage(error);

          if (onError) {
            onError(error);
          }
        }

      } catch (error) {

        console.error(
          "Truecaller verification error:",
          error
        );

        setLoading(false);

        const message =
          error?.message ||
          "Truecaller verification failed.";

        setMessage(message);

        if (onError) {
          onError(message);
        }
      }
    };


  return (
    <div className="w-full">

      <button
        type="button"
        onClick={
          handleTruecallerLogin
        }
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3.5 font-medium text-white transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >

        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

            <span>
              Verifying...
            </span>
          </>
        ) : (
          <>
            <span className="text-lg font-bold">
              T
            </span>

            <span>
              Continue with Truecaller
            </span>
          </>
        )}

      </button>


      {message && (
        <p className="mt-3 text-center text-sm text-slate-400">
          {message}
        </p>
      )}

    </div>
  );
}
