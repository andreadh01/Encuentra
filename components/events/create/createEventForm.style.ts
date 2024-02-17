import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../../constants/theme";

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
  },
  container: {
    display: "flex",
    flexDirection: "column",

    backgroundColor:COLORS.white,
    flex: 1,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop:15,
    paddingBottom:25,
    gap: 13,
    paddingBottom: 36,
  },
  header: {
    fontSize: SIZES.xLarge,
    color: COLORS.darkBlue,
    fontWeight: "700",
    marginBottom: 4,
  },
  inputText: {
    fontSize: SIZES.medium,
    color: COLORS.dark,
  },
  picker: {
    flex: 1,
  },
  dateInputsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  durationAndFileContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  fieldErrorContainer: {
    flex: 1,
    gap: 4,
  },
  durationInputContainer: {
    flex: 1,
  },
  nextBtn: {
    backgroundColor: COLORS.purple,
    padding: 17,
    marginLeft: 24,
    marginRight: 24,
    marginTop: SIZES.xxLarge,
    borderRadius: 10,
  },
  nextBtnText: {
    textAlign: "center",
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: "bold",
  },
  errorField: {
    borderColor: COLORS.red,
  },
  errorText: {
    color: COLORS.red,
  },
});

export default styles;
