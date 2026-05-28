package com.example.freelancer.config;

import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class MultiFormatLocalTimeDeserializer extends JsonDeserializer<LocalTime> {

    @Override
    public LocalTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.hasToken(JsonToken.START_OBJECT)) {
            int hour = 0, minute = 0, second = 0, nano = 0;
            while (p.nextToken() != JsonToken.END_OBJECT) {
                String fieldName = p.getCurrentName();
                p.nextToken();
                switch (fieldName) {
                    case "hour":
                        hour = p.getIntValue();
                        break;
                    case "minute":
                        minute = p.getIntValue();
                        break;
                    case "second":
                        second = p.getIntValue();
                        break;
                    case "nano":
                        nano = p.getIntValue();
                        break;
                }
            }
            return LocalTime.of(hour, minute, second, nano);
        } else if (p.hasToken(JsonToken.VALUE_STRING)) {
            String text = p.getText();
            if (text.length() == 5) {
                return LocalTime.parse(text, DateTimeFormatter.ofPattern("HH:mm"));
            }
            return LocalTime.parse(text);
        } else if (p.hasToken(JsonToken.START_ARRAY)) {
            // handle [hour, minute, second, nano]
            int hour = p.nextIntValue(0);
            int minute = p.nextIntValue(0);
            int second = p.hasToken(JsonToken.END_ARRAY) ? 0 : p.nextIntValue(0);
            int nano = p.hasToken(JsonToken.END_ARRAY) ? 0 : p.nextIntValue(0);
            while (p.nextToken() != JsonToken.END_ARRAY)
                ;
            return LocalTime.of(hour, minute, second, nano);
        }
        return (LocalTime) ctxt.handleUnexpectedToken(LocalTime.class, p);
    }
}
